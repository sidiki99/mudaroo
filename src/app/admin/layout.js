import AdminGuard from "./AdminGuard";
import Header from "./components/Header";
import AdminNavbar from "./Navbar";
// import "../globals.css"


export default function AdminLayout({ children }) {
  return (
    <div className="flex ">
      <AdminGuard >
      <div className="min-h-screen bg-gray-100"  >
       <AdminNavbar />
        </div>

      <main className="mx-auto w-full max-w-screen-2xl p-6">
        
       
        <Header />
        {children}
        
      </main>
       </AdminGuard> 
     
    </div>
  );
}