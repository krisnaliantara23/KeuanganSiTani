import React from "react";

const Footer = () => {
  return (
    <footer className="bg[#004030] text-white mt-8">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Tentang */}
        <div>
          <h3 className="font-semibold mb-2">Tentang SiTani</h3>
          <p className="text-sm">
            Solusi pengelolaan keuangan pertanian modern dan mudah digunakan.
          </p>
        </div>

        {/* Sumber */}
        <div>
          <h3 className="font-semibold mb-2">Sumber</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/bantuan" className="hover:underline">Pusat Bantuan</a></li>
            <li><a href="/blog" className="hover:underline">Blog</a></li>
            <li><a href="/kontak" className="hover:underline">Kontak Kami</a></li>
          </ul>
        </div>

        {/* Produk */}
        <div>
          <h3 className="font-semibold mb-2">Produk</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/sitani-mobile" className="hover:underline">SiTani Mobile</a></li>
            <li><a href="/fitur-keuangan" className="hover:underline">Fitur Keuangan</a></li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="font-semibold mb-2">Kontak</h3>
          <ul className="space-y-1 text-sm">
            <li>Email: <a href="mailto:info@sitani.com" className="hover:underline">info@sitani.com</a></li>
            <li>Telp: +62 812-3456-7890</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-green-800 text-center py-4 text-sm">
        © {new Date().getFullYear()} SiTani. Semua Hak Dilindungi.
      </div>
    </footer>
  );
};

export default Footer;
