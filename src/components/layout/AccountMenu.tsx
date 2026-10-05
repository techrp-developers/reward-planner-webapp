import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../../context/AuthContext';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const name = user?.name || user?.full_name || user?.first_name || 'Your account';
  const avatar = user?.userImage || user?.avatar;
  const close = () => setAnchor(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    setError('');
    try {
      await logout();
      close();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <button
        id="account-menu-button"
        type="button"
        onClick={event => setAnchor(event.currentTarget)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? 'account-menu' : undefined}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white hover:bg-[#F6F2F8] border border-[#E4DCE9] flex items-center justify-center cursor-pointer shrink-0 text-[#1C0E28] focus-visible:outline-2 focus-visible:outline-[#78538F] focus-visible:outline-offset-2"
      >
        <MenuRoundedIcon sx={{ fontSize: 22 }} />
      </button>
      <Menu
        id="account-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: { 'aria-labelledby': 'account-menu-button', sx: { p: 1 } },
          paper: { sx: { mt: 1, width: 256, maxWidth: 'calc(100vw - 32px)', borderRadius: '16px', border: '1px solid #E4DCE9', boxShadow: '0 12px 32px #1C0E2818', color: '#1C0E28' } },
        }}
      >
        <MenuItem component={Link} to="/profile" onClick={close} sx={{ gap: 2, p: 1, borderRadius: '8px' }}>
          <Avatar src={avatar} alt={name} sx={{ width: 40, height: 40, bgcolor: '#F0E9F5', color: '#553767' }}>{name.charAt(0).toUpperCase()}</Avatar>
          <span className="min-w-0"><strong className="block text-sm font-semibold">Profile</strong><span className="block truncate text-xs text-[#776B80] max-w-[152px]">{name}</span></span>
        </MenuItem>
        <MenuItem onClick={handleLogout} disabled={loggingOut} sx={{ mt: 1, p: 1, borderTop: '1px solid #E4DCE9', borderRadius: '8px', fontSize: 13, color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2' } }}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" sx={{ color: '#DC2626' }} /></ListItemIcon>
          {loggingOut ? 'Logging out…' : 'Logout'}
        </MenuItem>
        {error && <li role="none"><p role="alert" className="p-2 text-xs text-red-700">{error}</p></li>}
      </Menu>
    </>
  );
}
