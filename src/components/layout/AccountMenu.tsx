import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarUrl } from '../../api/client';
import rpLogo from '../../assets/rp_logo_crisp.png';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const name = user?.name || user?.full_name || user?.first_name || 'Your account';
  const avatar = resolveAvatarUrl(user?.userImage || user?.user_image || user?.avatar || user?.photo);
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
      {/* RP Logo button in right corner opening Account Menu (Profile & Logout) */}
      <button
        id="account-menu-button"
        type="button"
        onClick={event => setAnchor(event.currentTarget)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? 'account-menu' : undefined}
        className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11.5 lg:h-11.5 rounded-full bg-white border border-[#E4DCE9] hover:border-[#D1C2DC] flex items-center justify-center shrink-0 shadow-xs hover:shadow-md transition-all group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#78538F] focus-visible:outline-offset-2"
        title="Account Menu (Profile & Logout)"
      >
        <img
          src={rpLogo}
          alt="RewardPlanners"
          className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 object-contain transition-transform duration-200 group-hover:scale-105"
        />
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
          paper: {
            sx: {
              mt: 1.5,
              width: 256,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: '16px',
              border: '1px solid #E4DCE9',
              boxShadow: '0 16px 36px rgba(28, 14, 40, 0.14)',
              color: '#1C0E28',
            },
          },
        }}
      >
        {/* Profile Link */}
        <MenuItem
          component={Link}
          to="/profile"
          onClick={close}
          sx={{ gap: 2, p: 1, borderRadius: '8px', '&:hover': { bgcolor: '#F6F2F8' } }}
        >
          <Avatar
            src={avatar}
            alt={name}
            sx={{ width: 40, height: 40, bgcolor: '#F0E9F5', color: '#553767', fontWeight: 600 }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <span className="min-w-0">
            <strong className="block text-sm font-semibold text-[#1C0E28]">Profile</strong>
            <span className="block truncate text-xs text-[#776B80] max-w-[152px]">{name}</span>
          </span>
        </MenuItem>

        {/* Home Link */}
        <MenuItem
          component={Link}
          to="/"
          onClick={close}
          sx={{
            gap: 1.5,
            p: 1,
            borderRadius: '8px',
            fontSize: 13,
            color: '#1C0E28',
            '&:hover': { bgcolor: '#F6F2F8' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <HomeOutlinedIcon fontSize="small" sx={{ color: '#78538F' }} />
          </ListItemIcon>
          <span>Home Dashboard</span>
        </MenuItem>

        {/* Logout Button */}
        <MenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          sx={{
            mt: 0.5,
            p: 1,
            borderTop: '1px solid #E4DCE9',
            borderRadius: '8px',
            fontSize: 13,
            color: '#DC2626',
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutOutlinedIcon fontSize="small" sx={{ color: '#DC2626' }} />
          </ListItemIcon>
          {loggingOut ? 'Logging out…' : 'Logout'}
        </MenuItem>

        {error && (
          <li role="none">
            <p role="alert" className="p-2 text-xs text-red-700">
              {error}
            </p>
          </li>
        )}
      </Menu>
    </>
  );
}
