export const mailFormContents = ({
  nickname,
  pin,
}: {
  nickname: string;
  pin: number;
}) => {
  return `
        <div
      style="
        margin: 0 !important;
        padding: 1rem !important;
        border: none !important;
        border-spacing: 0 !important;
        border-collapse: collapse !important;
        font-size: 14px !important;
        display: flex;
        gap: 30px !important;
        flex-direction: column;
        gap: 13px;
        max-width: 500px;
        text-align: center;
        font-family:
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Oxygen,
          Ubuntu,
          Cantarell,
          'Open Sans',
          'Helvetica Neue',
          sans-serif;
      "
    >
      <div
        style="
          margin-bottom: 20px;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          border-spacing: 0 !important;
          border-collapse: collapse !important;
        "
      >
        <h1
          style="
            letter-spacing: -2px;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            font-size: 30px !important;
          "
        >
          Dopoll - 인증키 발급
        </h1>
        <p
          style="
            font-size: 12px;
            opacity: 0.7;
            margin: 0 !important;
            padding: 0 !important;
            padding-top: 20px !important;
            border: none !important;
            border-spacing: 0 !important;
            border-collapse: collapse !important;
          "
        >
          Dopoll 비밀번호 변경 4 PIN 메일입니다.
        </p>
      </div>
      안녕하세요 "${nickname}" 님!

      <div
        style="
          text-align: center;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px !important;
          margin: 0 !important;
          padding: 0 !important;
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          border: 1px solid rgba(147, 73, 162, 0.2) !important;
        "
      >
        <h2
          style="
            color: rgb(147, 86, 190) !important;
            margin: 0 !important;
            padding: 10px !important;
            border: none !important;
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            border-radius: 5px;
            font-size: 40px;
          "
        >
          ${pin}
        </h2>
      </div>
      <div
        style="
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          border-spacing: 0 !important;
          border-collapse: collapse !important;
        "
      >
        <p
          style="
            font-size: 12px;
            opacity: 0.7;
            margin: 10px !important;
            padding: 0 !important;
            border: none !important;
            border-spacing: 0 !important;
            border-collapse: collapse !important;
          "
        >
          인증키를 Dopoll 핀번호 입력창에 입략해주세요
        </p>
        <p
          style="
            font-size: 12px;
            opacity: 0.7;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-spacing: 0 !important;
            border-collapse: collapse !important;
          "
        >
          문의 - squirrel309@naver.cocm
        </p>
      </div>
    </div>
    `;
};
