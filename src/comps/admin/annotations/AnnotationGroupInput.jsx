import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { Select, MultiSelect } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"


function AnnotationGroupMenuItem({ tag, handleClick, handleFocus, modifiers, selected }) {
  
  const { data: group, isLoading, isError } = hooks.annotations.useGetAnnotationGroupByTag({ tag })
  if (isError) return null

      return (<MenuItem
          icon={selected ? "tick" : "blank"}
          text={isLoading ? "... " : group.text}
          onClick={handleClick}
          onFocus={handleFocus}
          active={modifiers.active}
          labelElement={<div style={{
              maxWidth: "24rem",
              textAlign: "right",
              float: "right",
              textWrap: "wrap",
              marginRight: "1rem"
          }}>
              
              <div className="flex flex-column">
                  <div>{_.has(group, "text") ? group.text : "..."}</div>
                  <div>{_.has(group, "description") ? <div className="flex" style={{ float: "right" }}><strong>{group.description}</strong>
                
                      </div> : "..."}
                  </div>
                          
              </div>     
              
          </div>}>
          
      </MenuItem>
      )
  }
  

export function AnnotationGroupInput({ selectedItem = [], onItemSelect, disabled = false }) {
  const [query, setQuery] = useState("")
  const debounced = useDebounce(query, 200)

  const { data: items = [] } =
    hooks.annotations.useGetAnnotationGroupByQuery(
      { search_string: debounced },
      { staleTime: 2000 }
    )

  return (
    <Select
      items={Array.isArray(items) ? items : []}
      itemRenderer={(item, props) => (
        <AnnotationGroupMenuItem
          {...props}
          tag={item}
          selected={item === selectedItem}
        />
      )}
      onItemSelect={(tag) => onItemSelect(tag)}
      onQueryChange={setQuery}
      disabled={disabled}
      popoverProps={{ minimal: true }}
    >
      <Button icon="plus" minimal intent="primary">
        {selectedItem ? selectedItem : "Select Annotation Group"}
      </Button>
    </Select>
  )
}
