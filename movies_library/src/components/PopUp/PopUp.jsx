import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function MyPopup({text, setOpen, open, title, cb=()=>{}, submitBtn}) {
//   

  const handleClose = () => {
    setOpen(false);
    cb()
  };

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (open) {
      rootElement.setAttribute('inert', 'true');
    } else {
      rootElement.removeAttribute('inert');
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{typeof text === "string" ? "Warning" : title}</DialogTitle>
        {(submitBtn && typeof submitBtn === 'object' && submitBtn?.loading? 
          <DialogContent>
          {typeof text === "string" ? <p>{submitBtn.loading}</p> : text}
          </DialogContent>:
          
          <DialogContent>
          {typeof text === "string" ? <p>{text}</p> : text}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {Boolean(submitBtn && typeof submitBtn === 'object' && submitBtn && !submitBtn?.loading) && <Button onClick={submitBtn.cb}>{submitBtn.text}</Button>}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MyPopup;


// return (
//   <div>
//     <Dialog open={open} onClose={handleClose}>
//       <DialogTitle>Warning</DialogTitle>
//       <DialogContent>
//         <p>{text}</p>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose}>Close</Button>
//       </DialogActions>
//     </Dialog>
//   </div>
// );