import { GraduationCap, Timer, CalendarClock, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getNameFromToken } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
export default function MainPages() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Pengguna");

  useEffect(() => {
    const fullName = getNameFromToken();

    if (fullName) {
      const namaDepan = fullName.split(" ")[0];
      setFirstName(namaDepan);
    }
  }, []);

























































  return (
    <>
      <div className="flex flex-col gap-10 p-10 w-full max-w-full overflow-x-hidden">
        {/* card 1 welcome */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-md p-10">
          <div className="">
            <h1 className="text-4xl font-bold">Selamat Datang, {firstName}!</h1>
            <p className="text-2xl font-normal">Mau belajar apa hari ini?</p>
          </div>
          <div className="">
            <button
              onClick={() => navigate("/cari-kelas")}
              className="rounded-xl bg-[#406749] p-5 flex items-center gap-3 text-white capitalize font-bold cursor-pointer"
            >
              <GraduationCap className="w-6 h-6 " />
              <span>daftar kelas baru</span>
            </button>
          </div>
        </div>
        {/* card 2 statistic */}
        <div className="flex gap-6 xl:flex-wrap max-w-full justify-between items-center">
          {/* total hours */}
          <div className="rounded-2xl shadow-md flex-1 flex items-center p-5 gap-6 bg-white ">
            <div className="rounded-full p-3 bg-[#8FB996] shrink-0">
              <Timer className="w-8 h-8" color="#244A2F" />
            </div>
            <div className="flex flex-col ">
              <h4 className="uppercase font-semibold text-md tracking-wider whitespace-nowrap text-[#424942]">
                total jam belajar
              </h4>
              <p className="flex items-baseline gap-2">
                <span className="font-extrabold md:text-2xl xl:text-3xl text-slate-800">
                  42.5
                </span>
                <span className="font-medium text-lg text-slate-500">jam</span>
              </p>
            </div>
          </div>
          <div className="rounded-2xl shadow-md flex flex-1 items-center p-5 gap-6 bg-white ">
            <div className="rounded-full p-3 bg-[#FEBF89] shrink-0">
              <CalendarClock className="w-8 h-8" color="#794C20" />
            </div>
            <div className="flex flex-col">
              <h4 className="uppercase font-semibold text-md text-[#424942] tracking-wider whitespace-nowrap">
                sesi mendatang
              </h4>
              <p className="flex items-baseline gap-2">
                <span className="font-extrabold text-3xl text-slate-800">
                  3
                </span>
                <span className="font-medium text-lg text-slate-500">sesi</span>
              </p>
            </div>
          </div>
          <div className="rounded-2xl shadow-md flex flex-1 items-center p-5 gap-6 bg-white ">
            <div className="rounded-full p-4 bg-[#CBAD3C] shrink-0">
              <BookOpen className="w-8 h-8" color="#504100" />
            </div>
            <div className="flex flex-col">
              <h4 className="uppercase font-semibold text-md text-[#424942] tracking-wider whitespace-nowrap">
                banyak kelas diambil
              </h4>
              <p className="flex items-baseline gap-2">
                <span className="font-extrabold text-3xl text-slate-800">
                  3
                </span>
                <span className="font-medium text-lg text-slate-500">
                  mata pelajaran
                </span>
              </p>
            </div>
          </div>
        </div>
