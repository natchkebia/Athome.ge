import React from 'react'
import Contact from '../contact/Contact'
import LanguageDropdown from '../languageDropdown/LanguageDropdown'
import styles from './TopBar.module.scss'

const TopBar = () => {
  return (
    <div className={styles.container}>
    <Contact/>
    <LanguageDropdown/>
    </div>
  )
}

export default TopBar