import { useNavigate, useLocation } from 'react-router-dom';

export const scrollToSection = (id: string) => {
  const tryScroll = () => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64; // header height offset to match our navbar
      const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    } else {
      setTimeout(tryScroll, 100);
    }
  };
  tryScroll();
};

export const useGlobalSearchNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = (targetSection: string) => {
    if (location.pathname !== "/") {
      navigate("/", {
        state: {
          scrollTo: targetSection
        }
      });
    } else {
      scrollToSection(targetSection);
    }
  };

  return { navigateToSection };
};
