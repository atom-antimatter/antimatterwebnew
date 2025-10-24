import { FaQuoteLeft } from "react-icons/fa";
import BreakTitle from "./ui/BreakTitle";

const Testimonial = () => {
  return (
    <div className="flex flex-col gap-20 2xl:gap-30">
      <div className="flex flex-col">
        <BreakTitle text="What our clients" />
        <BreakTitle text="say about us" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-12 grid-rows-2 h-auto sm:h-[550px] gap-5 2xl:gap-10">
        <div className="py-8 sm:py-2 col-span-1 sm:col-span-6 md:col-span-5 row-span-2 bg-gradient-to-b from-foreground/5 to-background border border-foreground/15 rounded-2xl flex gap-10 flex-col justify-center px-8 xl:px-14">
          <FaQuoteLeft className="size-15 opacity-10  str" />
          <p className="text-lg lg:text-2xl italic font-extralight">
            &quot; The Antimatter team worked with me to build my e-commerce
            site. Within 90 days of launch, our store was exceeding $100k in
            monthly revenue. &quot;
          </p>
          <div>
            <h3 className="text-xl font-bold">Jay W.</h3>
            <h4>Rakanda Gold Coffee</h4>
          </div>
        </div>
        <div className="py-8 sm:py-2 col-span-1 sm:col-span-6 md:col-span-7 row-span-1 bg-gradient-to-b from-foreground/5 to-background border border-foreground/15 rounded-2xl flex gap-5 flex-col justify-center px-8 xl:px-14">
          <p className="lg:text-lg italic font-extralight">
            &quot; We worked with Antimatter to redesign our marketing site and
            SaaS platform, increasing both customer acquisition and retention.
            &quot;
          </p>
          <div>
            <h3 className="text-xl font-bold">Jon H.</h3>
            <h4>Keyspace Studio</h4>
          </div>
        </div>
        <div className="py-8 sm:py-2 col-span-1 sm:col-span-6 md:col-span-7 row-span-1 bg-gradient-to-b from-foreground/5 to-background border border-foreground/15 rounded-2xl flex gap-5 flex-col justify-center px-8 xl:px-14">
          <p className="lg:text-lg italic font-extralight">
            &quot; We wanted to build a new radiology staffing platform; with
            Antimatter we were able to design and launch a working MVP in under
            a month. &quot;
          </p>
          <div>
            <h3 className="text-xl font-bold">Mike R.</h3>
            <h4>RT Direct</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
