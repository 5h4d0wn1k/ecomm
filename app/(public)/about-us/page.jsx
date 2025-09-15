import { Link } from 'next/link';
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">About Us</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to DAV Creations, your trusted partner in quality products and innovative e-commerce solutions. We are committed to providing exceptional value and service to our customers and partners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Our Story */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded with a vision to revolutionize the e-commerce landscape, DAV Creations has grown from a small startup to a leading platform connecting sellers and buyers across India. Our journey began with a simple idea: to make quality products accessible to everyone while empowering local businesses to thrive.
            </p>
            <p className="text-gray-600">
              Today, we serve thousands of customers and support numerous sellers, fostering a community built on trust, innovation, and excellence.
            </p>
          </div>

          {/* Our Mission */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To empower businesses and consumers by providing a seamless, secure, and innovative e-commerce platform that drives growth and creates lasting value.
            </p>
            <p className="text-gray-600">
              We strive to bridge the gap between quality products and discerning customers, ensuring every transaction is smooth, every product meets high standards, and every partner succeeds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Our Vision */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-gray-600 mb-4">
              To be the most trusted and preferred e-commerce platform in India, known for our commitment to quality, innovation, and customer satisfaction.
            </p>
            <p className="text-gray-600">
              We envision a future where every business, big or small, can leverage technology to reach their full potential and where customers have access to the best products at competitive prices.
            </p>
          </div>

          {/* Our Values */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <ul className="text-gray-600 space-y-2">
              <li><strong>Integrity:</strong> We conduct business with honesty and transparency.</li>
              <li><strong>Innovation:</strong> We embrace new ideas and technologies to improve our services.</li>
              <li><strong>Customer Focus:</strong> Our customers are at the heart of everything we do.</li>
              <li><strong>Collaboration:</strong> We work together with our partners and community to achieve shared success.</li>
              <li><strong>Excellence:</strong> We strive for the highest standards in all our endeavors.</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            Whether you&apos;re a customer looking for quality products or a seller wanting to grow your business, DAV Creations is here for you.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/shop" className="bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out">
              Start Shopping
            </Link>
            <a href="/create-store" className="bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition duration-150 ease-in-out">
              Become a Seller
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}