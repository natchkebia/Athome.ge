import Link from "next/link";
import BasketPage from "../Basket/Basket";
import SearchBar from "../searchBar/SearchBar";
import SignIn from "../signIn/SignIn";
import WishlistPage from "../wishlist/WishlistPage";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <div className={styles.container}>
      <div className="site-wrapper">
        <Link href="/">
          <img
            src="/icons/Logo.svg"
            alt="Ethome Logo"
            className={styles.logo}
          />
        </Link>
        <SearchBar />
        <div className={styles.wrapper}>
          <SignIn />
          <Link href="/profile">
            <button className={styles.profileBtn}>პირადი</button>
          </Link>
          <Link href="/delivery">
            <button className={styles.profileBtn}>ყიდვა</button>
          </Link>
          <WishlistPage />
          <BasketPage />
        </div>
      </div>
    </div>
  );
}
