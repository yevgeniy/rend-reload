import React, { useState, useEffect } from "react";

export const useModel = (extractor, _init) => {
  const [val, setVal] = useState();

  const syncModel = fn => {};

  return [val, syncModel];
};
