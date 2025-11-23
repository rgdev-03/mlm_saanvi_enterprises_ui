import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import classes from '../assets/NavbarSimple.module.css';
import { CarIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import ConfirmationModal from "@/components/ConfirmationModal"; // adjust path if needed

const data = [
  { link: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { link: '/vehicles', label: 'Vehicles', icon: CarIcon },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState(() => {
    const current = data.find(item => item.link === location.pathname);
    return current ? current.label : data[0].label;
  });

  useEffect(() => {
    const current = data.find(item => item.link === location.pathname);
    if (current) setActive(current.label);
  }, [location.pathname]);

  // Logout modal control
  const [logoutOpened, setLogoutOpened] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // logout handler
  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);

    try {
      // 👉 Add your logout logic here
      // localStorage.removeItem("token");
      // await apiLogout(); // if you have API call

      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setLogoutLoading(false);
      setLogoutOpened(false);
    }
  };

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={item.label === active || undefined}
      to={item.link}
      key={item.label}
      onClick={() => setActive(item.label)}
    >
      <item.icon className={classes.linkIcon} size={25} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <>
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>{links}</div>

        <div className={classes.footer}>
          <Link
            to="#"
            className={classes.link}
            onClick={(event) => {
              event.preventDefault();
              setLogoutOpened(true); // open modal
            }}
          >
            <LogOut className={classes.linkIcon} size={25} />
            <span>Logout</span>
          </Link>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        opened={logoutOpened}
        onClose={() => setLogoutOpened(false)}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        loading={logoutLoading}
      />
    </>
  );
}
