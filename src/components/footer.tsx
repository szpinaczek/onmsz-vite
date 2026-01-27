const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-brown-300 dark:border-brown-600 py-4 text-center text-muted-foreground flex items-center justify-end text-sm">
      <p>&copy; {currentYear} <a href="mailto:szpinaczek11@gmail.com" className="text-brown-900 dark:text-brown-100">Andrzej Szczepanik</a></p>
    </footer>
  );
};

export default Footer;