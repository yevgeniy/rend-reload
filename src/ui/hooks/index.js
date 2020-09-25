import React, { useState, useRef } from "react";
import { useOpenStream, useMessageStream } from "./hooksSystem";

export * from "./hooksSystem";

export function useModal() {
  const [isShow, setIsShow] = useState(false);
  const def = useRef(null);

  const doShow = () => {
    setIsShow(true);
    return new Promise(res => {
      def.current = res;
    });
  };

  const onHide = () => {
    def.current = null;
    setIsShow(false);
  };

  const onDone = r => {
    def.current && def.current(r);
    onHide();
  };

  return [isShow, doShow, onDone, onHide];
}
