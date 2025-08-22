"use client";
import { useState, useCallback } from "react";

export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isView, setIsView] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);
  const openViewModal = useCallback(() => {
    setIsOpen(true);
    setIsView(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsView(false);
  }, []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal, isView, openViewModal };
};
