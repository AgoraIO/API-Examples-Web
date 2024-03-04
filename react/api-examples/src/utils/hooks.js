import { useLocation } from "react-router-dom"
import { useRef, useEffect, useCallback } from "react"
import { decodeUrlQuery } from "./utils"

export const useUrlQuery = (formRef) => {
  const { search } = useLocation() || {}
  useEffect(() => {
    const query = decodeUrlQuery(search)
    if (query.appId || query.channel) {
      formRef.current.setValue(query)
    }
  }, [formRef, search])
}

export const useEffectOnce = (effect) => {
  useEffect(effect, []);
};


export const useUnMount = (cb) => {
  const fnRef = useRef(cb);
  // update the ref each render so if it change the newest callback will be invoked
  fnRef.current = cb;

  useEffectOnce(() => () => fnRef.current());
};

export const useAnimationFrame = (isRunning = true, callback = () => { }) => {
  const reqIdRef = useRef();

  const loop = useCallback(() => {
    if (isRunning) {
      reqIdRef.current = requestAnimationFrame(loop);
      callback();
    }
  }, [callback])

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [loop])
}


