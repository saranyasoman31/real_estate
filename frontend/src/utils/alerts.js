import Swal from 'sweetalert2';

// Custom styled SweetAlert2 helper functions
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl p-6 font-sans text-slate-800 shadow-2xl border border-slate-100',
    title: 'text-lg font-black text-slate-900',
    htmlContainer: 'text-xs text-slate-600 leading-relaxed',
    confirmButton: 'px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition mx-1.5',
    cancelButton: 'px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition mx-1.5'
  },
  buttonsStyling: false
});

export const showAlertSuccess = (title, text) => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 3000,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

export const showAlertError = (title, text) => {
  return customSwal.fire({
    icon: 'error',
    title: title || 'Oops...',
    text: text || 'Something went wrong!',
    confirmButtonText: 'Understood'
  });
};

export const showConfirmDialog = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning'
}) => {
  const result = await customSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const showToast = (message, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon,
    title: message
  });
};

export default customSwal;
