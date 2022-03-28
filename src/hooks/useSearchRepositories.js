import { useState, useRef } from 'react'
import axios from 'axios'
import useDebounceEffect from './useDebounceEffect'
import searchRepositoriesAPI from '../apis/searchRepositoriesAPI'

function useSearchRepositories(searchText, page) {
  const abortControllerRef = useRef()

  const [isFetching, setIsFetching] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [result, setResult] = useState([])
  const [isIncomplete, setIsIncomplete] = useState(false)

  useDebounceEffect(
    () => {
      if (searchText !== '') {
        if (isFetching) {
          abortControllerRef.current.abort()
        }

        setIsFetching(true)
        setIsSuccess(false)
        abortControllerRef.current = new AbortController()

        searchRepositoriesAPI(
          { q: searchText, page },
          abortControllerRef.current
        )
          .then(data => {
            setIsFetching(false)
            setIsSuccess(true)

            if (page === 1) {
              setResult(data.items)
            } else {
              setResult(result => [...result, ...data.items])
            }

            setIsIncomplete(data.items.length === 30)
          })
          .catch(error => {
            setIsFetching(false)

            if (!axios.isCancel(error)) {
              window.alert(error)
            }
          })
      }
    },
    [searchText, page],
    500
  )

  return { isFetching, isSuccess, result, isIncomplete }
}

export default useSearchRepositories