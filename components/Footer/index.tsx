import styles from '../../styles/Footer.module.scss';
import { Github, Linkedin, Twitter } from '../../utils/icons';
import { IconType } from 'react-icons';

export default function Footer() {
  return (
    <div className={styles.footer}>
      <p>
        Made by{' '}
        <a href='https://github.com/FasihNoor' target='_blank' rel='noreferrer'>
          <b>Fasih Noor</b>
        </a>
      </p>
      <div>
        <a href='https://www.linkedin.com/in/fasihnoor/' className={styles.icon} target='_blank' rel='noreferrer'>
          <Linkedin />
        </a>
        <a href='https://github.com/FasihNoor' className={styles.icon} target='_blank' rel='noreferrer'>
          <Github />
        </a>
      </div>
    </div>
  );
}
