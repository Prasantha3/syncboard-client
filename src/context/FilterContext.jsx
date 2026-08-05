import { createContext, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const assignee = searchParams.get('assignee') || ''
  const status = searchParams.get('status') || ''
  const query = searchParams.get('q') || ''

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const value = useMemo(
    () => ({
      assignee,
      status,
      query,
      setAssignee: v => updateParam('assignee', v),
      setStatus: v => updateParam('status', v),
      setQuery: v => updateParam('q', v),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [assignee, status, query]
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}
