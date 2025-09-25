import { create } from 'zustand';

const useCelebrationStore = create((set) => ({
  name: '',
  message: '',
  setName: (name) => set({ name }),
  setMessage: (message) => set({ message }),
}));

export default useCelebrationStore;
