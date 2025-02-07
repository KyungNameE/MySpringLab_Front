// src/utils/codeUtil.ts
import axios from "axios";

export interface SdCode {
  sdCd: string;
  sdNm: string;
}

export interface SggCode {
  sdCd: string;
  sggCd: string;
  sggNm: string;
}

export interface EmdCode {
  sggCd: string;
  emdCd: string;
  emdNm: string;
}

// 시도 코드 조회 (ex. {sdCd, sdNm})
export const fetchSdCodes = async (): Promise<SdCode[]> => {
  try {
    const response = await axios.get("http://localhost:8080/api/cmm/sdCodes");
    // 필요한 필드만 매핑 (필요 시 추가 필드 사용 가능)
    return response.data.map((item: any) => ({
      sdCd: item.sdCd,
      sdNm: item.sdNm,
    }));
  } catch (error) {
    console.error("시도 코드 조회 오류:", error);
    return [];
  }
};

// 시군구 코드 조회 (ex. {sdCd, sggCd, sggNm})
export const fetchSggCodes = async (): Promise<SggCode[]> => {
  try {
    const response = await axios.get("http://localhost:8080/api/cmm/sggCodes");
    return response.data.map((item: any) => ({
      sdCd: item.sdCd,
      sggCd: item.sggCd,
      sggNm: item.sggNm,
    }));
  } catch (error) {
    console.error("시군구 코드 조회 오류:", error);
    return [];
  }
};

// 읍면동 코드 조회 (ex. {sggCd, emdCd, emdNm})
export const fetchEmdCodes = async (): Promise<EmdCode[]> => {
  try {
    const response = await axios.get("http://localhost:8080/api/cmm/emdCodes");
    return response.data.map((item: any) => ({
      sggCd: item.sggCd,
      emdCd: item.emdCd,
      emdNm: item.emdNm,
    }));
  } catch (error) {
    console.error("읍면동 코드 조회 오류:", error);
    return [];
  }
};
