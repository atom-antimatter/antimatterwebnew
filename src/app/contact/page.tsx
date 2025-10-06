import Button from "@/components/ui/Button";
import MainLayout from "@/components/ui/MainLayout";
import NavButton from "@/components/ui/NavButton";
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
    <MainLayout className="pt-40">
      <TransitionContainer>
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-10 xl:gap-30">
          <div className="w-auto xl:w-1/3 flex flex-col gap-6 shrink-0">
            <TitleH1Anim
              linesClass="overflow-hidden"
              className="text-5xl sm:text-7xl 2xl:text-8xl uppercase font-semibold text-nowrap"
            >
              Let&apos;s <br /> Connect
            </TitleH1Anim>
            <div>
              <NavButton />
            </div>
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
            <form action="/api/contact" method="post" className="w-full mt-10 flex flex-col gap-6">
              <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
                <div className="w-full flex flex-col">
                  <label htmlFor="name" className="font-light text-lg">
                    Name <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    id="name"
                    name="name"
                    className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label htmlFor="email" className="font-light text-lg">
                    Email <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="John@company.com"
                    id="email"
                    name="email"
                    className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
                  />
                </div>
              </div>
              <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
                <div className="w-full flex flex-col">
                  <label htmlFor="phone" className="font-light text-lg">
                    Phone Number <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 123-4567"
                    id="phone"
                    name="phone"
                    className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label htmlFor="service" className="font-light text-lg">
                    What are you looking for?{" "}
                    <span className="text-tertiary">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
                  >
                    <option value="" className="text-black">
                      Select Service...
                    </option>
                    <option value="web-development" className="text-black">
                      Web Development
                    </option>
                    <option value="ai-solutions" className="text-black">
                      AI Solutions
                    </option>
                    <option value="design-agency" className="text-black">
                      Design Agency
                    </option>
                    <option value="digital-marketing" className="text-black">
                      Digital Marketing
                    </option>
                    <option value="web3-development" className="text-black">
                      Web3 Development
                    </option>
                    <option value="security-solutions" className="text-black">
                      Security Solutions
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="font-light text-lg">
                  Message <span className="text-tertiary">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us more about your project..."
                  className="w-full outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
                ></textarea>
              </div>
              <div className="flex">
                <Button>
                  <span className="px-5">Send Message</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </TransitionContainer>
    </MainLayout>
  );
};

export default ContactPage;
