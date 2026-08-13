import BasketPage from "../Basket/Basket";
import SearchBar from "../searchBar/SearchBar";
import SignIn from "../signIn/SignIn";
import WishlistPage from "../wishlist/WishlistPage";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <div className={styles.container}>
      <div className="site-wrapper">
        <a href="/" aria-label="მთავარ გვერდზე დაბრუნება">
          <img
            src="/icons/Logo.svg"
            alt="Ethome Logo"
            className="header-logo"
          />
        </a>
        <SearchBar />
        <div className={styles.wrapper}>
          <SignIn />
          <WishlistPage />
          <BasketPage />
        </div>
      </div>
    </div>
  );
}
