'use client'
import { PackageIcon, Search, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import {useUser, useClerk, UserButton, Protect} from "@clerk/nextjs"

const Navbar = () => {

    const {user} = useUser()
    const {openSignIn} = useClerk()
    const router = useRouter();

    const [search, setSearch] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
        setIsMenuOpen(false)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-red-500">Dav</span>Creations<span className="text-red-600 text-5xl leading-0">.</span>
                        <Protect plan='plus'>
                             <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                            </p>
                        </Protect>
                       
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/about-us">About</Link>
                        <Link href="/contact">Contact</Link>
                        <Link href="/terms-and-conditions">Terms and Conditions</Link>
                        <Link href="/shipping-delivery">Shipping & Delivery Policy</Link>
                        <Link href="/privacy-policy">Privacy Policy</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                    {
                        !user ? (
                            <button onClick={openSignIn} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                            Login
                            </button>
                        ) : (
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<PackageIcon size={16}/>} label="My Orders" onClick={()=> router.push('/orders')}/>
                                </UserButton.MenuItems>
                            </UserButton>
                        )
                    }
                        

                    </div>

                    {/* Mobile Menu and User Button */}
                    <div className="sm:hidden flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        { user ? (
                            <div className="flex gap-2">
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<ShoppingCart size={16}/>} label="Cart" onClick={()=> router.push('/cart')}/>
                                </UserButton.MenuItems>
                            </UserButton>
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<PackageIcon size={16}/>} label="My Orders" onClick={()=> router.push('/orders')}/>
                                </UserButton.MenuItems>
                            </UserButton>
                            </div>
                        ) : (
                            <button onClick={openSignIn} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                            Login
                        </button>
                        )
                        }
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="sm:hidden fixed inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-6 py-8">
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-slate-600">
                        <X size={24} />
                    </button>
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Home</Link>
                    <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Shop</Link>
                    <Link href="/about-us" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">About</Link>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Contact</Link>
                    <Link href="/terms-and-conditions" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Terms and Conditions</Link>
                    <Link href="/shipping-delivery" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Shipping & Delivery Policy</Link>
                    <Link href="/privacy-policy" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-600 hover:text-slate-800 transition">Privacy Policy</Link>
                    <form onSubmit={handleSearch} className="flex items-center w-80 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                        <Search size={18} className="text-slate-600" />
                        <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                    </form>
                    <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="relative flex items-center gap-2 text-xl text-slate-600 hover:text-slate-800 transition">
                        <ShoppingCart size={18} />
                        Cart
                        <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                    </Link>
                </div>
            )}

            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar