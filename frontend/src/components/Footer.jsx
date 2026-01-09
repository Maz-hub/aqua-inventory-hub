/**
 * Footer Component
 *
 * Displays at the bottom of the homepage with contact info and version details.
 * Shows copyright, contact email, and system information.
 */

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wa-navy text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: About */}
          <div>
            <h3 className="text-xl font-bold mb-3">Aqua Inventory Hub</h3>
            <p className="text-gray-300 text-sm">
              Inventory management system for World Aquatics gifts and apparel.
            </p>
          </div>

          {/* Center: Contact */}
          <div>
            <h3 className="text-xl font-bold mb-3">Contact</h3>
            <p className="text-gray-300 text-sm mb-2">
              For support or questions:
            </p>
            <a
              href="mailto:marianna.mirabile@worldaquatics.com"
              className="text-wa-cyan hover:text-white transition-colors"
            >
              marianna.mirabile@worldaquatics.com
            </a>
          </div>

          {/* Right: Info */}
          <div>
            <h3 className="text-xl font-bold mb-3">System Info</h3>
            <p className="text-gray-300 text-sm">Version: 1.0.0</p>
            <p className="text-gray-300 text-sm">Built with Django & React</p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-gray-600 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} World Aquatics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
