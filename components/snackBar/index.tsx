import {Alert, Snackbar} from '@mui/material'

interface SnackBarProps {
  openSnackbar: any
  message: any
  handleCloseSnackbar?: any
}

export default function SnackBar({openSnackbar, message, handleCloseSnackbar}: SnackBarProps) {
  const onClose = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    handleCloseSnackbar?.()
  }

  return (
    <>
      {message && <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={openSnackbar}
        onClose={onClose}
        key={'top' + 'left'}
        autoHideDuration={8000}
      >
        <Alert
          onClose={onClose}
          severity={message.success?`success`:'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {typeof message === 'string'?
            <>{message}</>
            :
            message?.map((item: string, i: number) => {
              return(
                <span key={i}>{item}<br/></span>
              )
            })
          }
        </Alert>
      </Snackbar>}
    </>
  )
}

