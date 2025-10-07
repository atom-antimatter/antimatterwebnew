import { create } from "zustand";

interface LoadingProps {
  isLoading: boolean;
  finished: boolean;
  setisLoading: (state: boolean) => void;
  setFinished: (state: boolean) => void;
}

export const useLoading = create<LoadingProps>((set) => ({
  isLoading: true,
  finished: false,
  setisLoading: (state: boolean) => set({ isLoading: state }),
  setFinished: (state: boolean) => set({ finished: state }),
}));

export const useActiveIndex = create<{
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}>((set) => ({
  activeIndex: 0,
  setActiveIndex: (index: number) => set({ activeIndex: index }),
}));

export const useStartProjectModal = create<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export const usePageTransition = create<{
  isTransition: boolean;
  setIsTransition: (state: boolean) => void;
}>((set) => ({
  isTransition: false,
  setIsTransition: (state: boolean) => set({ isTransition: state }),
}));
