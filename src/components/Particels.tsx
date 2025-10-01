import Particles3D from "./Particles3D";

const Particels = () => {
  return (
    <div
      className="absolute lg:fixed pointer-events-none opacity-0 -mt-30 sm:-mt-0 top-1/2 left-1/2 -translate-1/2 size-[500px] sm:size-[700px] 2xl:size-[900px] z-10"
      id="particles3d"
    >
      <div className="relative w-full h-full   2xl:translate-x-0">
        <Particles3D />
        <div className="size-1/2 top-1/2 left-1/2 -translate-1/2 absolute bg-primary rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default Particels;
