import Reveal from "./ui/Reveal";
import DottedWorldMap from "./ui/DottedWorldMap";
import Button from "./ui/Button";
import TransitionLink from "./ui/TransitionLink";

const EdgeDeploymentSection = () => {
  return (
    <div className="py-32 sm:py-40" id="edge-deployment-section">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16 lg:gap-20">
        {/* Left: Animated map */}
        <div className="relative w-full md:w-1/2 order-2 md:order-1">
          <DottedWorldMap variant="enterpriseEdge" />
        </div>
        
        {/* Right: Content */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <Reveal>
            <p className="text-sm uppercase tracking-wider text-foreground/60 mb-4">
              Edge Deployment
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6">
              Edge AI for Maximum Speed
            </h2>
            <p className="text-base sm:text-lg text-foreground/80 mb-8 leading-relaxed">
              Deploy Atom closer to your users for ultra-low latency voice, search, and agent execution. With edge compute and private networking, you get faster responses, lower bandwidth costs, and tighter control over data movement.
            </p>
            
            {/* Bullets */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-secondary mt-1 flex-shrink-0">→</span>
                <span className="text-sm sm:text-base">Sub-second interactions for voice + GenUI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-secondary mt-1 flex-shrink-0">→</span>
                <span className="text-sm sm:text-base">Run inference and orchestration at the edge (or hybrid)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-secondary mt-1 flex-shrink-0">→</span>
                <span className="text-sm sm:text-base">Private networking and regional controls for regulated workloads</span>
              </li>
            </ul>
            
            {/* Partnership line */}
            <p className="text-xs sm:text-sm text-foreground/50 mb-8 italic">
              Powered by our edge partnership with Akamai + Linode.
            </p>
            
            {/* CTA */}
            <div className="flex">
              <TransitionLink href="/contact">
                <Button>
                  <span className="px-5">Explore Edge Deployment</span>
                </Button>
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default EdgeDeploymentSection;

