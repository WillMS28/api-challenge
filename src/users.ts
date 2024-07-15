import User from "./models/User";

const getUser = async (id: string): Promise<User | null> => {
  try {
    const user = await User.findById(id)
      .populate("Wallet")
      .populate("walletId");
    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }
};

const getUsers = async (): Promise<User[]> => {
  try {
    const users = await User.find().populate("walletId"); // Busca todos os usuários e popula a wallet
    return users; // Retorna a lista de usuários encontrados
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }
};

const createUser = async (name: string, email: string): Promise<User> => {
  try {
    const user = new User({ name, email });
    return await user.save(); // Salva o novo usuário no banco de dados
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error('Erro ao criar usuário');
  }
};

export { getUser, createUser, getUsers };
