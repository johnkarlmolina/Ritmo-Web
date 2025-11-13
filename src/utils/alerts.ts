import Swal from 'sweetalert2';

// Custom styled alerts for Ritmo app
export const showSuccess = (message: string, title: string = 'Success!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#2D7778',
    confirmButtonText: 'OK',
  });
};

export const showError = (message: string, title: string = 'Error') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#2D7778',
    confirmButtonText: 'OK',
  });
};

export const showWarning = (message: string, title: string = 'Warning') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonColor: '#2D7778',
    confirmButtonText: 'OK',
  });
};

export const showInfo = (message: string, title: string = 'Info') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonColor: '#2D7778',
    confirmButtonText: 'OK',
  });
};

export const showConfirm = (
  message: string,
  title: string = 'Are you sure?',
  confirmText: string = 'Yes',
  cancelText: string = 'No'
) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2D7778',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};
