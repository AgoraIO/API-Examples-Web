import { useLocation } from "react-router-dom"
import { useRef, useEffect, useCallback } from "react"

export const useUrlQuery = () => {
  const { search } = useLocation() || {}
  let query = useRef(null)

  if (query.current) {
    return query.current
  }
  if (search.length) {
    query.current = search
      .slice(1)
      .split('&')
      .map((str) => [str.split('=')[0], str.split('=')[1]])
      .reduce((acc, a) => {
        acc[a[0]] = a[1];
        return acc;
      }, {});
  }
  return query.current || {}
}



export const useUnMount = (cb) => {
  useEffect(() => {
    return () => cb();
  }, []);
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
