import React, { memo } from 'react'
import { Typography } from '@mui/material'

function NoData() {
  return (
    <div
      style={{
        height: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        color: '#ccc',
        verticalAlign: 'middle',
        paddingLeft: '30px',
        zIndex: 10,
      }}
    >
      <Typography style={{ fontWeight: 'bold' }} variant="h5">
        No Data
      </Typography>
    </div>
  )
}

export default memo(NoData)
