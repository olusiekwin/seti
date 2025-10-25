import { SOCIAL_LINKS, COMPANY_INFO } from '@/constants/social'
import { Twitter, Linkedin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="./seti_.svg" alt="Seti logo" className="h-8 w-8" />
              <span
                className="text-2xl font-bold text-foreground"
                style={{
                  fontFamily: "'Fortune Variable'",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Seti
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {COMPANY_INFO.description}
            </p>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <a 
                href={SOCIAL_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(208,65%,75%)] hover:text-[hsl(208,65%,85%)] transition-colors"
              >
                {SOCIAL_LINKS.handles.website}
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-transparent border-border/50 hover:border-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)]/10"
                asChild
              >
                <a 
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <Twitter className="w-4 h-4 text-[hsl(208,65%,75%)]" />
                  <span className="text-foreground">{SOCIAL_LINKS.handles.twitter}</span>
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-transparent border-border/50 hover:border-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)]/10"
                asChild
              >
                <a 
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <Linkedin className="w-4 h-4 text-[hsl(208,65%,75%)]" />
                  <span className="text-foreground">{SOCIAL_LINKS.handles.linkedin}</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <a href="/dashboard" className="text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors">
                Dashboard
              </a>
              <a href="/activity" className="text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors">
                Activity
              </a>
              <a href="/profile" className="text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors">
                Profile
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 {COMPANY_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}