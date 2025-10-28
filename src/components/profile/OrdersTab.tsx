"use client";
import styles from "./OrdersTab.module.scss";

export default function OrdersTab() {
  const fakeOrders = [
    {
      id: 23424,
      buyer: "გიორგი ბაგრატიონი",
      email: "giorgibagrationi@gmail.com",
      date: "19/11/2020, 18:00",
      total: "450.00 ₾",
      status: "გადახდილი",
    },
    {
      id: 23425,
      buyer: "გიორგი ბაგრატიონი",
      email: "giorgibagrationi@gmail.com",
      date: "22/11/2020, 14:00",
      total: "120.00 ₾",
      status: "უარყოფილი",
    },
    {
      id: 23426,
      buyer: "გიორგი ბაგრატიონი",
      email: "giorgibagrationi@gmail.com",
      date: "01/12/2020, 10:00",
      total: "320.00 ₾",
      status: "მოლოდინის რეჟიმი",
    },
  ];

  return (
    <div className={styles.ordersSection}>
      {fakeOrders.length === 0 ? (
        <h4>ჩემი შეკვეთები</h4>
      ) : (
        <>
          <h4>ჩემი შეკვეთები</h4>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>მომხმარებელი</th>
                <th>თარიღი</th>
                <th>ფასი</th>
                <th>სტატუსი</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fakeOrders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.Colord}>#{order.id}</td>
                  <td>
                    <p>{order.buyer}</p>
                    <span>{order.email}</span>
                  </td>
                  <td className={styles.Colord}>{order.date}</td>
                  <td>{order.total}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        order.status === "გადახდილი"
                          ? styles.done
                          : order.status === "უარყოფილი"
                          ? styles.canceled
                          : styles.pending
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <img src="/icons/orders.svg" alt="detail" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button>‹</button>
            <span className={styles.active}>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <button>›</button>
          </div>
        </>
      )}
    </div>
  );
}
