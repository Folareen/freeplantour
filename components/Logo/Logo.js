import Logo2 from "../../assets/logo2.png";
import Image from "next/image";


export const Logo = () => {
  return (
    <div className="text-3xl text-center py-4 font-heading justify-center">
      <Image
        src={Logo2}
        alt="Free Plan Tour"
        style={{ opacity: "0.8", marginLeft: 'auto', marginRight: 'auto' }}
      />
    </div>
  );
};
