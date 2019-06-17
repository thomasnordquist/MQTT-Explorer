import * as React from 'react'
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core'

interface Props {
  value: string
  onChange: (event: React.ChangeEvent<{}>, value: string) => void
}
export function EditorModeSelect(props: Props) {
  const labelStyle = { margin: '0 8px 0 8px' }
  return (
    <RadioGroup
      style={{ display: 'inline-block', float: 'left' }}
      value={props.value}
      onChange={props.onChange}
      row={true}
    >
      <FormControlLabel
        value="text"
        style={labelStyle}
        control={<Radio color="primary" />}
        label="raw"
        labelPlacement="top"
      />
      <FormControlLabel
        value="xml"
        style={labelStyle}
        control={<Radio color="primary" />}
        label="xml"
        labelPlacement="top"
      />
      <FormControlLabel
        value="json"
        style={labelStyle}
        control={<Radio color="primary" />}
        label="json"
        labelPlacement="top"
      />
    </RadioGroup>
  )
}
