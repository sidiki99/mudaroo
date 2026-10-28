import SearchBox from "./SearchBox";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur">
      <SearchBox />
      <div className="flex items-center gap-2">
        {/* <NotificationBell /> */}
        <ProfileMenu />
      </div>
    </header>
  );
}
