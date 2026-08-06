import type { PolicySection } from "@/components/legal/PolicyPage";
import type { StorefrontLocale } from "@/lib/i18n/locale";

type PolicyCopy = { title: string; eyebrow: string; intro: string; sections: PolicySection[] };

export const termsCopy: Record<StorefrontLocale, PolicyCopy> = {
  ka: {
    title: "წესები და პირობები",
    eyebrow: "იურიდიული ინფორმაცია",
    intro: "ვებგვერდით სარგებლობისა და Athome.ge-ზე შეკვეთის განთავსების ძირითადი წესები.",
    sections: [
      { title: "ზოგადი პირობები", paragraphs: ["ვებგვერდი ეკუთვნის შპს ეთ-კომპუტერს (ს/კ 420439181). საიტზე შესვლითა და შეკვეთის განთავსებით მომხმარებელი ეთანხმება წინამდებარე პირობებს."], bullets: ["მომხმარებელი უნდა იყოს სრულწლოვანი ქმედუნარიანი პირი, ან 16 წელს მიღწეული და შესაბამისი ნებართვის მქონე პირი.", "მომხმარებელი ვალდებულია მოგვაწოდოს სრული და ზუსტი ინფორმაცია, დაიცვას ინტელექტუალური საკუთრება და არ შეუქმნას საფრთხე საიტის უსაფრთხოებას.", "აკრძალულია სხვა პირის ანგარიშის ან მონაცემების გამოყენება და კანონსაწინააღმდეგო მოქმედება."] },
      { title: "რეგისტრაცია და ანგარიში", paragraphs: ["პროდუქტის შეძენა შესაძლებელია როგორც რეგისტრაციით, ისე სტუმრის სტატუსით. რეგისტრირებული მომხმარებელი პასუხისმგებელია ანგარიშის მონაცემების სიზუსტესა და პაროლის კონფიდენციალურობაზე."], bullets: ["ცვლილების შემთხვევაში მონაცემები დროულად უნდა განახლდეს.", "ანგარიშის მესამე პირისთვის გადაცემა დაუშვებელია."] },
      { title: "მომსახურება და საიტის გამოყენება", paragraphs: ["მომსახურება ხელმისაწვდომია საქართველოს მასშტაბით, თუმცა კომპანიას შეუძლია კონკრეტული მომსახურების ან მიწოდების შეზღუდვა. საიტის ინფორმაცია შესაძლოა წინასწარი შეტყობინების გარეშე განახლდეს."], bullets: ["აკრძალულია სისტემაში არასანქცირებული წვდომა და ინფორმაციის არასათანადო გამოყენება.", "კომპანია არ იძლევა საიტის უწყვეტი და უშეცდომო მუშაობის აბსოლუტურ გარანტიას.", "კანონით მოთხოვნილ შემთხვევაში ინფორმაცია შეიძლება გადაეცეს უფლებამოსილ ორგანოს."] },
      { title: "პერსონალური ინფორმაცია", paragraphs: ["შეკვეთის დამუშავებისა და მომსახურების გასაწევად მუშავდება მომხმარებლის მიერ მოწოდებული ინფორმაცია. ბარათის მონაცემები Athome.ge-ზე არ ინახება და მუშავდება პარტნიორი ბანკის დაცულ გვერდზე."], bullets: ["ინფორმაცია გამოიყენება შეკვეთის, მხარდაჭერის, სტატისტიკისა და მომსახურების გაუმჯობესებისთვის.", "ანგარიშის მონაცემების წაშლა შესაძლებელია კანონითა და ტრანზაქციების შენახვის ვალდებულებით დადგენილ ფარგლებში."] },
      { title: "ონლაინ შესყიდვა", paragraphs: ["შეკვეთის განთავსება შესაძლებელია 24 საათის განმავლობაში. მომხმარებელი ირჩევს პროდუქტს, ამატებს კალათაში და ასრულებს ჩექაუთის ეტაპებს."] },
      { title: "შეკვეთა, მიწოდება და გაუქმება", paragraphs: ["შეკვეთის მომზადებისა და მიწოდების დრო დამოკიდებულია შეკვეთის დროზე, მისამართსა და არჩეულ სერვისზე. რეგიონებში მიწოდება, როგორც წესი, 1–3 სამუშაო დღეს მოითხოვს."], bullets: ["შეკვეთის გაუქმების მოთხოვნა შესაძლებელია განთავსებიდან 3 დღის განმავლობაში, შეკვეთის სტატუსისა და მოქმედი კანონმდებლობის გათვალისწინებით.", "მიწოდების დეტალური პირობები მოცემულია მიწოდების გვერდზე."] },
      { title: "საკონტაქტო ინფორმაცია", paragraphs: ["პირობებთან ან შეკვეთასთან დაკავშირებული კითხვებისთვის მოგვწერეთ info@athome.ge-ზე ან დაგვიკავშირდით ნომერზე +995 599 09 32 09."] },
    ],
  },
  en: {
    title: "Terms and conditions",
    eyebrow: "Legal information",
    intro: "The principal rules for using the website and placing an order with Athome.ge.",
    sections: [
      { title: "General terms", paragraphs: ["The website is owned by ET-Computers LLC (ID 420439181). By using the website and placing an order, you agree to these terms."], bullets: ["You must be a legally capable adult, or at least 16 years old with the required permission.", "You must provide complete and accurate information, respect intellectual-property rights, and protect website security.", "Using another person’s account or data and any unlawful activity are prohibited."] },
      { title: "Registration and accounts", paragraphs: ["Products may be purchased with or without registration. Registered users are responsible for the accuracy of their details and the confidentiality of their password."], bullets: ["Update your information when it changes.", "Do not transfer account access to a third party."] },
      { title: "Service and website use", paragraphs: ["Services are available throughout Georgia, although the company may restrict a particular service or delivery. Website information may be updated without prior notice."], bullets: ["Unauthorized system access and misuse of information are prohibited.", "The company cannot guarantee uninterrupted and error-free website operation.", "Information may be disclosed to authorized bodies when required by law."] },
      { title: "Personal information", paragraphs: ["Information you provide is processed to fulfil orders and deliver services. Card details are not stored by Athome.ge and are processed on a partner bank’s secure page."], bullets: ["Information is used for orders, support, statistics, and service improvement.", "Account information may be deleted subject to legal and transaction-record obligations."] },
      { title: "Online purchases", paragraphs: ["Orders can be placed 24/7. Select a product, add it to the cart, and complete the checkout steps."] },
      { title: "Orders, delivery and cancellation", paragraphs: ["Preparation and delivery times depend on order time, destination, and selected service. Regional delivery generally takes 1–3 business days."], bullets: ["Cancellation may be requested within three days of placing an order, subject to its status and applicable law.", "See the delivery page for detailed delivery terms."] },
      { title: "Contact information", paragraphs: ["For questions about these terms or an order, email info@athome.ge or call +995 599 09 32 09."] },
    ],
  },
};

export const privacyCopy: Record<StorefrontLocale, PolicyCopy> = {
  ka: {
    title: "კონფიდენციალურობის პოლიტიკა",
    eyebrow: "თქვენი მონაცემები",
    intro: "როგორ აგროვებს, იყენებს და იცავს Athome.ge მომხმარებლის პერსონალურ ინფორმაციას.",
    sections: [
      { title: "პოლიტიკის მოქმედების სფერო", paragraphs: ["პოლიტიკა ვრცელდება ინფორმაციაზე, რომელსაც Athome.ge იღებს ვებგვერდის, პროდუქტებისა და სერვისების გამოყენებისას. საიტის გამოყენება ნიშნავს მონაცემთა დამუშავების აღწერილ პირობებზე თანხმობას."], bullets: ["პოლიტიკა ვრცელდება მხოლოდ Athome.ge-ზე და არა მესამე მხარის ვებგვერდებზე.", "მომხმარებელი პასუხისმგებელია მის მიერ მოწოდებული ინფორმაციის სიზუსტეზე."] },
      { title: "რა მონაცემებს ვაგროვებთ", paragraphs: ["რეგისტრაციისა და შეკვეთისას შეიძლება დამუშავდეს სახელი, გვარი, ტელეფონი, ელფოსტა, პირადი ნომერი, საცხოვრებელი და მიწოდების მისამართი."], bullets: ["ტექნიკური მონაცემები: IP მისამართი, cookie, ბრაუზერი, წვდომის დრო, მონახულებული გვერდი და რეფერერი.", "შესყიდვების ისტორია და სერვისის გამოყენებასთან დაკავშირებული ჩანაწერები.", "საბანკო ბარათის მონაცემები Athome.ge-ზე არ ინახება."] },
      { title: "დამუშავების მიზნები", bullets: ["მომხმარებლის იდენტიფიკაცია, შეკვეთის გაფორმება და შესრულება.", "მომხმარებელთან კომუნიკაცია და მოთხოვნების დამუშავება.", "უსაფრთხოება, თაღლითობის პრევენცია და გადახდების კანონიერების კონტროლი.", "ვებგვერდის გაუმჯობესება, პერსონალიზაცია და თანხმობის შემთხვევაში შეთავაზებების მიწოდება."] },
      { title: "Cookies და ტექნიკური მონაცემები", paragraphs: ["Cookies გვეხმარება ავტორიზაციის, საიტის ფუნქციონირებისა და სტატისტიკის უზრუნველყოფაში. მათი გამორთვისას ზოგიერთი ფუნქცია შეიძლება ხელმისაწვდომი აღარ იყოს."] },
      { title: "მონაცემების გადაცემა", paragraphs: ["შეკვეთის შესასრულებლად აუცილებელი მონაცემები შეიძლება გადაეცეს კურიერულ, საფოსტო, საკომუნიკაციო და გადახდის მომსახურების მიმწოდებლებს."], bullets: ["მონაცემები ასევე შეიძლება გადაიცეს მომხმარებლის თანხმობით ან კანონით გათვალისწინებულ შემთხვევაში.", "მესამე მხარეს გადაეცემა მხოლოდ მომსახურებისთვის საჭირო მოცულობა."] },
      { title: "შენახვა და უსაფრთხოება", paragraphs: ["Athome.ge იყენებს ორგანიზაციულ და ტექნიკურ ზომებს მონაცემების არასანქცირებული წვდომისგან დასაცავად. ინტერნეტით მონაცემთა გადაცემის აბსოლუტური უსაფრთხოება ვერ იქნება გარანტირებული."], bullets: ["წვდომა აქვთ მხოლოდ შესაბამის თანამშრომლებსა და კონტრაქტორებს.", "ტრანზაქციებთან დაკავშირებული ინფორმაცია ინახება კანონით საჭირო ვადით."] },
      { title: "მომხმარებლის უფლებები", paragraphs: ["მომხმარებელს შეუძლია მოითხოვოს საკუთარი მონაცემების განახლება, გასწორება ან წაშლა იმ ფარგლებში, რასაც კანონი და ტრანზაქციების შენახვის ვალდებულება იძლევა. მოთხოვნისთვის დაგვიკავშირდით info@athome.ge-ზე."] },
    ],
  },
  en: {
    title: "Privacy policy", eyebrow: "Your data", intro: "How Athome.ge collects, uses, and protects customers’ personal information.",
    sections: [
      { title: "Scope", paragraphs: ["This policy covers information received by Athome.ge when you use the website, products, and services. Using the website means accepting the processing described here."], bullets: ["It applies to Athome.ge, not third-party websites.", "You are responsible for the accuracy of the information you provide."] },
      { title: "Information we collect", paragraphs: ["Registration and checkout may involve your name, phone, email, personal ID, residential address, and delivery address."], bullets: ["Technical data: IP address, cookies, browser, access time, visited page, and referrer.", "Purchase history and service-use records.", "Athome.ge does not store payment-card details."] },
      { title: "Why we process data", bullets: ["To identify customers and fulfil orders.", "To communicate with customers and handle requests.", "For security, fraud prevention, and payment verification.", "To improve and personalize the website and, with consent, provide relevant offers."] },
      { title: "Cookies and technical data", paragraphs: ["Cookies support sign-in, essential website functions, and statistics. Disabling them may make some functionality unavailable."] },
      { title: "Sharing information", paragraphs: ["Data needed to fulfil an order may be shared with courier, postal, communication, and payment providers."], bullets: ["It may also be shared with your consent or when required by law.", "Only information required to provide the service is shared."] },
      { title: "Storage and security", paragraphs: ["Athome.ge applies organizational and technical safeguards against unauthorized access, although absolute security of internet transmission cannot be guaranteed."], bullets: ["Access is limited to relevant staff and contractors.", "Transaction information is retained for legally required periods."] },
      { title: "Your rights", paragraphs: ["You may request that your data be updated, corrected, or deleted, subject to law and transaction-retention obligations. Contact info@athome.ge to submit a request."] },
    ],
  },
};

export const returnCopy: Record<StorefrontLocale, PolicyCopy> = {
  ka: {
    title: "დაბრუნების პოლიტიკა", eyebrow: "მარტივი დაბრუნება", intro: "ონლაინ შეძენილი პროდუქტის დაბრუნების ვადები, პირობები და პროცედურა.",
    sections: [
      { title: "14-დღიანი დაბრუნების უფლება", paragraphs: ["ფიზიკურ პირს უფლება აქვს ონლაინ შეძენილი ტექნიკა მიღებიდან 14 კალენდარული დღის განმავლობაში, მიზეზის მითითების გარეშე დააბრუნოს."], bullets: ["ეს უფლება არ ვრცელდება იურიდიულ პირებსა და მეწარმე სუბიექტებზე.", "30 ლარის ან ნაკლები ღირებულების ნივთსა თუ მომსახურებაზე 14-დღიანი დაბრუნების პირობა არ ვრცელდება."] },
      { title: "ვადის ათვლა", bullets: ["მომსახურებაზე — ხელშეკრულების დადებიდან.", "საქონელზე — მომხმარებლის ან მის მიერ განსაზღვრული მესამე პირის მიერ ნივთის მიღებიდან.", "ნაწილ-ნაწილ მიწოდებისას — ბოლო ნივთის მიღებიდან.", "რეგულარული მიწოდებისას — პირველი ნივთის მიღებიდან."] },
      { title: "პროდუქტის მდგომარეობა", paragraphs: ["პროდუქტი უნდა დაბრუნდეს სრული კომპლექტაციითა და პირვანდელი, დაუზიანებელი ქარხნული შეფუთვით. ყუთის მხოლოდ დათვალიერებისთვის გახსნა დაზიანებად არ ითვლება."], bullets: ["პლომბი, თუ პროდუქტს ჰქონდა, არ უნდა იყოს დაზიანებული.", "უნდა დაბრუნდეს ყველა აქსესუარი, დამტენი, კაბელი, ვაუჩერი და აქციის ფარგლებში მიღებული ნივთი; სხვაგვარად მათი ღირებულება ანაზღაურებას გამოაკლდება.", "თავდაპირველი ნაკლის შემთხვევაში მოქმედებს საგარანტიო პირობები."] },
      { title: "როგორ მოვითხოვოთ დაბრუნება", paragraphs: ["გამოგზავნეთ განაცხადი info@athome.ge-ზე ან კომპანიის ოფიციალურ Facebook გვერდზე პირადი შეტყობინებით. მიუთითეთ შეკვეთისა და მიღების თარიღები, სახელი, მისამართი, საკონტაქტო ინფორმაცია და განაცხადის თარიღი."], bullets: ["ფორმის დადასტურების შემდეგ პროდუქტი მიიტანეთ შეთანხმებულ დაბრუნების პუნქტში.", "პროდუქტის უნაკლო მდგომარეობა მოწმდება კომპანიისთვის გადაცემისას."] },
      { title: "ტრანსპორტირება და თანხის დაბრუნება", paragraphs: ["მომხმარებელს შეუძლია ნივთი თავად მოიტანოს ან გადაიხადოს უკან ტრანსპორტირების ღირებულება."], bullets: ["გაბარიტული ნივთი: 55 ₾; ყოველი მომდევნო ნივთი — 15 ₾.", "არაგაბარიტული ნივთი: 20 ₾; ყოველი მომდევნო ნივთი — 5 ₾.", "თანხა ბრუნდება შეტყობინებიდან არაუგვიანეს 14 კალენდარული დღისა, თავდაპირველი გადახდის მეთოდით. კომპანიას შეუძლია დაელოდოს ნივთის ან მისი გაგზავნის დამადასტურებელი საბუთის მიღებას."] },
    ],
  },
  en: {
    title: "Return policy", eyebrow: "Simple returns", intro: "Time limits, conditions, and steps for returning a product purchased online.",
    sections: [
      { title: "14-day right of return", paragraphs: ["An individual consumer may return equipment bought online without giving a reason within 14 calendar days of receiving it."], bullets: ["This right does not apply to legal entities or business customers.", "The 14-day return condition does not apply to items or services costing GEL 30 or less."] },
      { title: "When the period starts", bullets: ["For services: when the agreement is concluded.", "For goods: when you or your nominated third party receives them.", "For split deliveries: when the final item is received.", "For recurring deliveries: when the first item is received."] },
      { title: "Product condition", paragraphs: ["The product must be returned complete and in its original, undamaged factory packaging. Opening the box solely to inspect the item does not count as damage."], bullets: ["Any original seal must remain intact.", "Return all accessories, chargers, cables, vouchers, and promotional items; otherwise their value may be deducted.", "If an item had an initial defect, the warranty terms apply."] },
      { title: "How to request a return", paragraphs: ["Send a request to info@athome.ge or by private message to the company’s official Facebook page. Include the order and receipt dates, your name, address, contact details, and request date."], bullets: ["After approval, bring the product to the agreed return point.", "The product’s condition is verified when it is handed to the company."] },
      { title: "Transport and refund", paragraphs: ["You may bring the item yourself or pay for return transport."], bullets: ["Oversized item: GEL 55; each additional item: GEL 15.", "Standard item: GEL 20; each additional item: GEL 5.", "Refunds are issued within 14 calendar days of notice using the original payment method. The company may wait until it receives the item or proof of dispatch."] },
    ],
  },
};
