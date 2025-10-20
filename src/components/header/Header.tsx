import SearchBar from "../searchBar/SearchBar";
import SignIn from "../signIn/SignIn";
import styles from './Header.module.scss'

export default function Header() {
  return (
    <div className={styles.container}>
      <img src="./icons/Logo.svg" alt="computer" />
      <SearchBar />
      <div className={styles.wrapper}>
        <SignIn />
        <img src="./icons/Heart.svg" alt="heart" />
        <img src="./icons/Cart.svg" alt="cart" />
      </div>
    </div>
  );
}
