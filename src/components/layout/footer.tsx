export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with{' '}
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Claude Code
            </a>
            . © {currentYear} The Collector.
          </p>
        </div>
      </div>
    </footer>
  )
}
