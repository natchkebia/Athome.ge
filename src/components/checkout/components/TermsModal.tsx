"use client";
import styles from "../Step4Payment.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface TermsModalProps {
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ onClose, onAccept }: TermsModalProps) {
  const en = useStorefrontLocale() === "en";

  if (en) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalScroll}>
            <div className={styles.modalContent}>
              <h4>This website is owned and operated by LLC athome.ge.</h4>
              <p>By accessing this website and placing an order, you agree to these terms. If you do not agree, please stop using the website.</p>
              <p>For questions about these terms or your order, contact us at <a href="mailto:info@athome.ge">info@athome.ge</a> or <a href="tel:+995599093209">+995 599 09 32 09</a>.</p>
              <h5>1. General terms</h5>
              <p>You confirm that you are legally eligible to use the service, will provide accurate information, respect intellectual-property rights, and will not compromise the website’s security or operation.</p>
              <h5>2. Registration</h5>
              <p>You may purchase products with or without registration. Registered users must keep their account information accurate and secure and are responsible for activity performed through their account.</p>
              <h5>3. Service and website use</h5>
              <p>Delivery is available throughout Georgia, subject to service-area and product restrictions. Website information may change without prior notice. Unauthorized access, misuse of passwords or data, and illegal activity are prohibited.</p>
              <h5>4. Personal information and privacy</h5>
              <p>We process personal information required to handle orders, operate the website, compile statistics, and provide relevant offers. Payment-card details are not stored on this website; payments are processed on a partner bank’s secure page.</p>
              <h5>5. Online purchasing</h5>
              <p>Orders may be placed online at any time. Add the desired products to your cart and complete the checkout steps.</p>
              <h5>6. Delivery and cancellation</h5>
              <p>Delivery times depend on when the order is received, the destination, business days, and the selected delivery service. Regional delivery normally takes 1–3 business days. An order may be cancelled within three days after it is placed, subject to applicable law and order status.</p>
              <h5>7. Contact information</h5>
              <ul><li><a href="mailto:info@athome.ge">info@athome.ge</a></li><li><a href="tel:+995599093209">+995 599 09 32 09</a></li><li>LLC athome.ge</li><li>16 Vepkhistqaosani Street, 0180 Tbilisi</li></ul>
            </div>
          </div>
          <button className={styles.modalConfirm} onClick={() => { onAccept(); onClose(); }}>I have read and agree</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalScroll}>
          <div className={styles.modalContent}>
            <h4>
              აღნიშნული ვებგვერდი წარმოადგენს შპს athome.ge (ს/კ #) საკუთრებას.
            </h4>

            <p>
              თუ თქვენთვის ხელმისაწვდომია ამ საიტზე შესვლა და შეკვეთის
              განთავსება ესეიგი თქვენ ეთანხმებით ჩვენი ხელშეკრულების პირობებს.
              თუ თქვენ არ ეთანხმებით ჩვენს მიერ შემოთავაზებულ პირობებს, გთხოვთ
              შეწყვიტოთ ვებგვერდით სარგებლობა.
            </p>

            <p>
              ხელშეკრულების პირობებთან და შემდგომში წარმოქმნილ პრობლემებთან
              დაკავშირებით ნებისმიერი შეკითხვით შეგიძლიათ მოგვმართოთ:
              <br />
              <strong>შპს allmarket.ge</strong> &nbsp;
              <a href="mailto:info@athome.ge">info@athome.ge</a> &nbsp;
              <a href="tel:+995599093209">+995 599 09 32 09</a>
            </p>

            <h5>1. ზოგადი პირობები</h5>

            <h6>ტერმინთა განმარტება:</h6>
            <ul>
              <li>
                <strong>ჩვენ</strong> – შპს athome.ge (ს/კ #), შემდგომში –
                კომპანია;
              </li>
              <li>
                <strong>თქვენ</strong> – პირი, რომელიც შედის ვებგვერდზე; ასევე
                იურიდიული პირი, რომლის სახელითაც ფიზიკური პირი შედის ვებგვერდზე;
              </li>
              <li>
                <strong>ხელშეკრულება</strong> – წინამდებარე დოკუმენტი;
              </li>
            </ul>

            <h6>ვებგვერდით სარგებლობისას თქვენ:</h6>
            <ul>
              <li>
                ადასტურებთ, რომ ხართ სრულწლოვანი (18+) ან 16+ და გაქვთ ნებართვა
                შესაბამისი პირებისაგან;
              </li>
              <li>დაიცავთ ხელშეკრულებით გათვალისწინებულ პირობებს;</li>
              <li>
                წარმოადგენთ სწორ და ზუსტ ინფორმაციას ჩვენი მომსახურებების
                მისაღებად;
              </li>
              <li>
                დაიცავთ საავტორო და ინტელექტუალურ უფლებებს; არ გაავრცელებთ
                ვებგვერდზე არსებულ ინფორმაციას;
              </li>
              <li>
                მოერიდებით საიტის, გვერდისა და ანგარიშის უსაფრთხოების დარღვევას;
              </li>
              <li>
                არ განახორციელებთ ქმედებას, რომელიც საფრთხეს უქმნის ვებგვერდის
                ან მომსახურების ფუნქციონირებას;
              </li>
              <li>არ განახორციელებთ არალეგალურ ქმედებებს;</li>
            </ul>

            <h5>2. რეგისტრაცია</h5>

            <p>
              პროდუქტის შეძენა შესაძლებელია საიტზე შეკვეთის საფუძველზე
              (რეგისტრაციის შემდეგ ან რეგისტრაციის გარეშე).
            </p>

            <p>
              რეგისტრაციის ან საიტზე ინფორმაციის შეყვანის შემთხვევაში თქვენ
              დაეთანხმებით მხოლოდ ზუსტ და სრულ ინფორმაციას, და ახორციელებთ მის
              განახლებას ცვლილების შემთხვევაში.
            </p>

            <p>
              დარეგისტრირებისას თქვენ მიიღებთ ინდივიდუალურ მანდატს
              ავტორიზაციისთვის („ანგარიშის“ მონაცემები). „შპს athome.ge“–ის
              ვებგვერდით სარგებლობა **მხოლოდ** თქვენი ანგარიშით არის
              ნებადართული.
            </p>

            <p>
              კომპანია იტოვებს უფლებას დაბლოკოს ვებგვერდზე შესვლა იმ ფიზიკური ან
              იურიდიული პირებისათვის, რომელთა ანგარიშზე დაშვება ადრე შეწყვეტილი
              იქნა. თქვენ არ გაქვთ უფლება ასეთი პირებისთვის დარეგისტრიროთ
              ანგარიში.
            </p>

            <h5>3. მომსახურების მიღებისა და ვებგვერდის გამოყენების პირობები</h5>

            <h6>მიტანის სერვისი:</h6>
            <p>
              მომსახურება ხელმისაწვდომია საქართველოს მასშტაბით. კომპანია იტოვებს
              უფლებას შეზღუდოს ან უარი თქვას მომსახურებაზე.
            </p>

            <h6>შეზღუდვები ვებგვერდის გამოყენებაზე:</h6>
            <p>
              ვებგვერდზე არსებული ინფორმაცია შეიძლება შეიცვალოს ან მოიხსნას
              წინასწარი შეტყობინების გარეშე. კომპანია არ იძლევა გარანტიას უწყვეტ
              და შეცდომების გარეშე მუშაობაზე.
            </p>

            <p>
              აკრძალულია საიტის სისტემებში არასანქცირებული შესვლა, პაროლის
              არასათანადო გამოყენება, ინფორმაციის არასათანადო გამოყენება და
              მსგავსი ქმედებები.
            </p>

            <p>
              თქვენ თანხმობას აცხადებთ, რომ კომპანიას უფლება აქვს თქვენი
              ინფორმაცია გაამჟღავნოს:
            </p>

            <ul>
              <li>ჩვენთან აფილირებულ ნებისმიერ პირთან;</li>
              <li>ნებისმიერ პირთან თქვენი თანხმობით;</li>
              <li>კანონით გათვალისწინებულ ორგანოებთან;</li>
            </ul>

            <h6>პასუხისმგებლობის შეზღუდვა:</h6>
            <p>
              კომპანია არ იღებს პასუხისმგებლობას ნებისმიერ გარანტიაზე ან
              პრეტენზიაზე ვებგვერდთან დაკავშირებით.
            </p>

            <p>
              მომხმარებელი ვალდებულია თავი შეიკავოს ვებგვერდის გამოყენებისგან,
              თუ პლატფორმა არ მუშაობს გამართულად. ასეთ შემთხვევაში ნებისმიერი
              რისკი ეკისრება მომხმარებელს.
            </p>

            <h5>4. მომხმარებლის შესახებ ინფორმაცია და მისი გამოყენება</h5>

            <h6>კონფიდენციალურობა:</h6>
            <p>კომპანია აგროვებს:</p>
            <ul>
              <li>პირად საიდენტიფიკაციო ინფორმაციას;</li>
              <li>არაპირად საიდენტიფიკაციო ინფორმაციას;</li>
            </ul>

            <h6>პირადი საიდენტიფიკაციო ინფორმაცია:</h6>
            <p>
              შეიცავს: სახელი, გვარი, პირადი ნომერი, ელფოსტა, სქესი, დაბადების
              თარიღი, და ბარათის მონაცემები გადახდისას. ბარათის ინფორმაცია **არ
              ინახება** ვებგვერდზე — გადახდა ხდება პარტნიორი ბანკის დაცულ
              გვერდზე.
            </p>

            <p>ინფორმაცია გამოიყენება მხოლოდ:</p>

            <ul>
              <li>შეკვეთის დასამუშავებლად;</li>
              <li>სტატისტიკისთვის;</li>
              <li>ვებგვერდის მართვისთვის;</li>
              <li>სპეციალური შეთავაზებების მიწოდების მიზნით;</li>
            </ul>

            <h6>არაპირადი საიდენტიფიკაციო ინფორმაცია:</h6>
            <p>შეიცავს: Browser ტიპი, IP მისამართი და სხვა.</p>

            <h6>ინფორმაციის განახლება:</h6>
            <p>
              თქვენ შეგიძლიათ შეცვალოთ ინფორმაცია პროფილიდან. ზოგი მონაცემი
              დაცულია ტრანზაქციის ისტორიის გამო.
            </p>

            <h5>5. ონლაინ შესყიდვის პროცედურა</h5>
            <p>
              შეკვეთების მიღება ხდება 24/7 რეჟიმში. სურვილი პროდუქტები დაამატეთ
              კალათაში ან გამოიყენეთ კატეგორიები.
            </p>

            <h5>6. შეკვეთის მიღება</h5>
            <ul>
              <li>
                12:00–მდე მიღებული შეკვეთები თბილისში იგზავნება იმავე დღეს;
              </li>
              <li>16:00–მდე — მომდევნო დღეს;</li>
              <li>შაბათს 12:00–მდე — იგზავნება ორშაბათს;</li>
            </ul>

            <p>რეგიონებში მიწოდება 1–3 სამუშაო დღეში.</p>

            <h6>შეკვეთის გაუქმება:</h6>
            <p>
              შეკვეთის გაუქმება შესაძლებელია 3 (სამი) დღეში შეკვეთის განთავსების
              შემდეგ.
            </p>

            <h5>7. საკონტაქტო ინფორმაცია</h5>

            <ul>
              <li>
                <a href="mailto:info@athome.ge">info@athome.ge</a>
              </li>
              <li>
                <a href="tel:+995599093209">+995 599 09 32 09</a>
              </li>
              <li>
                <a href="#">Facebook გვერდი/Page</a>
              </li>
              <li>შპს athome.ge (ს/კ #)</li>
              <li>მისამართი: ვეფხისტყაოსნის ქუჩა #16, 0180 თბილისი</li>
            </ul>
          </div>
        </div>

        <button
          className={styles.modalConfirm}
          onClick={() => {
            onAccept();
            onClose();
          }}
        >
          გავეცანი და ვეთანხმები
        </button>
      </div>
    </div>
  );
}
