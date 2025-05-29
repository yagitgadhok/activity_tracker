/**
 * Handles user logout by cleaning up local storage and redirecting to login
 */
export const logout = () => {
  // Clear auth data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  
  // Redirect to login page
  window.location.href = '/';
};
