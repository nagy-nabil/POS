import { type SetStateAction, type Dispatch} from "react";
import { useTranslation } from "next-i18next";
import { generateInputDateValue } from "@/utils/date";

type FromToDateT = {
  fromDate: Date;
  toDate: Date;
  setFromDate: Dispatch< SetStateAction<Date>>;
  setToDate: Dispatch<SetStateAction<Date>>;
}

export function FromToDate({
  fromDate, toDate, setFromDate, setToDate 
}: FromToDateT) {

  const { t } = useTranslation("analysis");
  return (
        <div className="flex flex-col gap-3 w-full h-full">
          <label className="flex items-center justify-between gap-2 text-2xl">
            {t("orderHistory.from")}
            <input
              name="from"
              type="date"
              // yyyy-mm-dd
              value={generateInputDateValue(fromDate)}
              onChange={(e) =>
                setFromDate(() => {
                  const d = new Date(e.target.value);
                  d.setHours(0, 0, 0, 0);
                  return d;
                })
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90
 rounded-xl border-none p-3 text-xl "
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-2xl">
            {t("orderHistory.to")}
            <input
              value={generateInputDateValue(toDate)}
              onChange={(e) =>
                setToDate(() => {
                  const d = new Date(e.target.value);
                  d.setHours(23, 59, 59, 999);
                  return d;
                })
              }
              name="to"
              type="date"
              className="bg-primary text-primary-foreground hover:bg-primary/90
 rounded-xl border-none p-3 text-xl "
            />
          </label>
          </div>
  )
}
