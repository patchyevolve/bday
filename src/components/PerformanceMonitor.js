import React, { useEffect, useRef, useState } from 'react';
import {monitorMemoryUsage, getAdaptiveQualitySettings } from '../utils/performanceOptimizations';

/**
 * Performance monitoring component
 * Monitors and displays performance metrics in development mode
 */
const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [metrics, setMetrics] = useState({
    frameRate: 0,
    memoryUsage: 0,
    renderTime: 0,
    gameLoopTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      // Update frame rate
      frameCountRef.current++;
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setMetrics(prev => ({
          ...prev,
          frameRate: fps,
          memoryUsage: monitorMemoryUsage()?.usage || 0
        }));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Update memory usage
      const memory = monitorMemoryUsage();
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usage
        }));
      }
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    if (enabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [enabled]);

  if (!enabled || !isVisible) {
    return null;
  }

  const getPerformanceColor = (value, thresholds) => {
    if (value >= thresholds.good) return '#4ade80'; // green
    if (value >= thresholds.warning) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const frameRateColor = getPerformanceColor(metrics.frameRate, { good: 50, warning: 30 });
  const memoryColor = getPerformanceColor(100 - metrics.memoryUsage, { good: 70, warning: 50 });

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <h3>Performance Monitor</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="close-btn"
        >
          ×
        </button>
      </div>
      
      <div className="performance-metrics">
        <div className="metric">
          <span className="metric-label">FPS:</span>
          <span 
            className="metric-value" 
            style={{ color: frameRateColor }}
          >
            {metrics.frameRate}
          </span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Memory:</span>
          <span 
            className="metric-value" 
            style={{ color: memoryColor }}
          >
            {metrics.memoryUsage.toFixed(1)}%
          </span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Device:</span>
          <span className="metric-value">
            {window.innerWidth < 768 ? 'Mobile' : 'Desktop'}
          </span>
        </div>
      </div>

      <div className="performance-actions">
        <button 
          onClick={() => {
            // Force garbage collection if available
            if (window.gc) {
              window.gc();
            }
          }}
          className="action-btn"
        >
          Force GC
        </button>
        
        <button 
          onClick={() => {
            // Log performance data
            console.log('Performance Metrics:', metrics);
            console.log('Quality Settings:', getAdaptiveQualitySettings());
          }}
          className="action-btn"
        >
          Log Data
        </button>
      </div>

      <style jsx>{`
        .performance-monitor {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          z-index: 9999;
          min-width: 200px;
          backdrop-filter: blur(10px);
        }

        .performance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .performance-header h3 {
          margin: 0;
          font-size: 14px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .performance-metrics {
          margin-bottom: 10px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .metric-label {
          color: #ccc;
        }

        .metric-value {
          font-weight: bold;
        }

        .performance-actions {
          display: flex;
          gap: 5px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

/**
 * Performance optimization hook
 */
export const usePerformanceOptimization = () => {
  const [qualitySettings, setQualitySettings] = useState(getAdaptiveQualitySettings());
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      const memory = monitorMemoryUsage();
      const isLowEnd = memory && memory.usage > 80;
      setIsLowPerformance(isLowEnd);
      
      if (isLowEnd) {
        setQualitySettings(getAdaptiveQualitySettings());
      }
    };

    const interval = setInterval(checkPerformance, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    qualitySettings,
    isLowPerformance,
    setQualitySettings
  };
};

/**
 * Frame rate limiter hook
 */
export const useFrameRateLimit = (targetFPS = 60) => {
  const frameRef = useRef();
  const lastTimeRef = useRef(0);

  const limitFrameRate = (callback) => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    const targetFrameTime = 1000 / targetFPS;

    if (deltaTime >= targetFrameTime) {
      lastTimeRef.current = now;
      callback();
    } else {
      frameRef.current = requestAnimationFrame(() => limitFrameRate(callback));
    }
  };

  const cancelFrameRateLimit = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };

  return { limitFrameRate, cancelFrameRateLimit };
};

export default PerformanceMonitor;
