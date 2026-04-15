import { BreathingContext } from "@/contexts/BreathingContextProvider";
import { PetContext } from "@/contexts/PetContextProvider";
import { SearchContext } from "@/contexts/SearchContextProvider";
import { useContext } from "react";

export function usePetContext() {
  const context = useContext(PetContext);

  if (!context)
    throw new Error("usePetContext must be used within a PetContextProvider");

  return context;
}

export function useSearchContext() {
  const context = useContext(SearchContext);

  if (!context)
    throw new Error(
      "useSearchContext must be used within a SearchContextProvider",
    );

  return context;
}

export function useBreathingContext() {
  const context = useContext(BreathingContext);

  if (!context)
    throw new Error(
      "useBreathingContext must be used within a BreathingContextProvider",
    );

  return context;
}
