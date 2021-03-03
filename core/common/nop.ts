// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
export const nop = () => {
  console.trace();
  console.warn("WARNING: Calling the placeholder nop() - should not happen");
};
