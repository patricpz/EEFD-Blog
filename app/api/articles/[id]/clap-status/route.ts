import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: any
) {
  try {
    // Funcionalidade de clap/curtida desativada temporariamente
    return NextResponse.json({ hasClapped: false, disabled: true }, { status: 200 });

    // Código original:
    // const { params } = context as { params: { id: string } };
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ hasClapped: false });
    // }
    // const articleId = parseInt(params.id);
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (!user) {
    //   return NextResponse.json({ hasClapped: false });
    // }
    // const existingClap = await prisma.clap.findFirst({
    //   where: { article_id: articleId, user_id: user.id }
    // });
    // return NextResponse.json({ hasClapped: !!existingClap });
  } catch (error) {
    console.error('Erro ao verificar status do clap:', error);
    return NextResponse.json({ hasClapped: false });
  }
}
