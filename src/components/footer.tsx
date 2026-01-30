const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-brown-300 dark:border-brown-600 py-4 text-center text-muted-foreground flex items-center justify-end text-sm">
      <p>&copy; {currentYear} Andrzej Szczepanik</p>
    </footer>
  );
};

export default Footer;