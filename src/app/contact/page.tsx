import ContactForm from "@/components/ui/ContactForm";
import MainLayout from "@/components/ui/MainLayout";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import TransitionContainer from "@/components/ui/TransitionContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Antimatter AI to discuss your next AI or product initiative.",
};

const ContactPage = () => {
  return (
    <MainLayout className="pt-50">
      <TransitionContainer>
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-10 xl:gap-30">
          <div className="w-auto xl:w-1/3 flex flex-col gap-6 shrink-0">
            <TitleH1Anim
              linesClass="overflow-hidden"
              className="text-5xl sm:text-7xl 2xl:text-8xl uppercase font-semibold text-nowrap"
            >
              Let&apos;s <br /> Connect
            </TitleH1Anim>
            {/* <div> <NavButton /> </div> */}
          </div>
          <div className="w-full">
            <p className="text-foreground/90 max-w-lg">
              Let&apos;s talk about your next big idea. Use the form to tell us
              more, or simply drop us an email at{" "}
              <a
                href="mailto:clients@antimatterai.com"
                className="text-tertiary underline"
              >
                clients@antimatterai.com
              </a>
            </p>
            <ContactForm />
          </div>
        </div>
      </TransitionContainer>
    </MainLayout>
  );
};

export default ContactPage;
